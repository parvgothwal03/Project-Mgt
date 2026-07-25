import { Inngest } from "inngest";
import { prisma } from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

//Inngest functions to save user data to the database 
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk',
    triggers: [{event: 'clerk/user.created'}]},
    async ({event, step}) => {
        const {data} = event;

        await step.run("create-user-in-db" , async () => {
        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses?.[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
        })
    }
);

//Inngest functions to delete user data from the database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk',
    triggers: [{event: 'clerk/user.deleted'}]},
    async ({event, step}) => {
        const {data} = event
        await step.run("delete-user-from-db", async () => {
            await prisma.user.delete({
                where: {
                    id: data.id
                }
            })
        })
    }
)

//Inngest functions to update user data in the database
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk',
    triggers: [{event: 'clerk/user.updated'}]},
    async ({event, step}) => {
        const {data} = event
        await step.run("update-user-in-db", async () => {
            await prisma.user.update({
                where: {
                    id: data.id
                },
            data: {
                email: data?.email_addresses?.[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    })
}
)

//Inngest function to save workspace data to the database
const syncWorkspaceCreation = inngest.createFunction(
    {id: 'sync-workspace-from-clerk',
    triggers: [{event: 'clerk/organization.created'}]},
        async ({ event, step }) => {
            const { data } = event;
            await step.run("create-workspace-in-db", async () => {
                await prisma.workspace.create({
                    data: {
                        id: data.id,
                        name: data.name,
                        slug: data.slug,
                        ownerId: data.created_by,
                        image_url: data.image_url,
                    }
                })
            })

            //Add creator as ADMIN member
            await step.run("create-workspace-member-in-db", async () => {
                await prisma.workspaceMember.create({
                    data: {
                        userId: data.created_by,
                        workspaceId: data.id,
                        role: 'ADMIN',
                    }
                })
            })
        }
)

//Inngest function to update workspace data in the database
const syncWorkspaceUpdation = inngest.createFunction(
    {id: 'update-workspace-from-clerk',
    triggers: [{event: 'clerk/organization.updated'}]},
    async ({ event, step }) => {
        const { data } = event;
        await step.run("update-workspace-in-db", async () => {
            await prisma.workspace.update({
                where: {
                    id: data.id
                },
                data: {
                    name: data.name,
                    slug: data.slug,
                    image_url: data.image_url
                }
            })
        })
    }
)

//Inngest function to delete workspace data from the database
const syncWorkspaceDeletion = inngest.createFunction(
 {id: 'delete-workspace-with-clerk',
    triggers: [{event: 'clerk/organization.deleted'}]},
    async ({ event, step }) => {
        const { data } = event;
        await step.run("delete-workspace-from-db", async () => {
            await prisma.workspace.delete({
                where: {
                    id: data.id
                }
            })
        })
    }
)

//Inngest function to save workspace member data in the database
const syncWorkspaceMemberCreation = inngest.createFunction(
    {id: 'sync-workspace-member-from-clerk',
    triggers: [{event: 'clerk/organizationInvitation.accepted'}]},
    async ({ event, step }) => {
        const { data } = event;
        await step.run("create-workspace-member-in-db", async () => {
            await prisma.workspaceMember.create({
                data: {
                    userId: data.user_id,
                    workspaceId: data.organization_id,
                    role: String(data.role_name).toUpperCase(),
                }
            })
        })
    }
)



// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation];